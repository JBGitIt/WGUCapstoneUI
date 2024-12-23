import React, { useState, useEffect } from 'react';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import Table from '../Components/Table';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function AdjustData() {
    const [s_Series, s_setSeries] = useState();
    const [s_Data, s_setData] = useState();
    const [s_adjusted, s_setAdjusted] = useState(false);

    useEffect(() => {
        if (s_Series != null) {
            s_setData("Loading");
            s_setAdjusted(false);
            async function GetRawData() {
                try {
                    const response = await fetch(`/ML/raw?l_STRseries=${s_Series}`);
                    if (!response.ok) {
                        throw new Error('Not ok bro. Sad face');
                    }
                    const data = await response.json();
                    s_setData(data);
                } catch (error) {
                    console.error('Could not fetch data', error);
                }
                
            }

            GetRawData();
        }
    }, [s_Series]);

    async function GetAdjustedData() {
        s_setData("Loading");
        try {
            const response = await fetch(`/ML/adjusted?l_STRseries=${s_Series}`);
            if (!response.ok) {
                throw new Error('Not ok bro. Sad face');
            }
            const data = await response.json();
            s_setData(data);
        } catch (error) {
            console.error('Could not fetch data', error);
        }
        s_setAdjusted(true);
    }

    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                  { link: "/Data", label: "Data Explanation" }
                , { link: "/Data/RawData", label: "Raw Data Extract" }
                , { link: "/Data/DataPrep", label: "Prepping the Data" }
                , { link: "/Data/DataVisualization", label: "Visualizing the Data" }
                , { link: "/Data/Hypothesis", label: "Hypothesis Resolution" }
            ]} />
            <MainContent>
                <div className="d-flex">
                    <Dropdown
                        updateValue={s_setSeries}
                        defaultStateValue={{ label: "Select Series", value: "" }}
                        listItems={[
                            { label: "Commercial/Industrial Loans", value: "BUSLOANS" }
                            , { label: "USA GDP", value: "GDP" }
                            , { label: "Imports Goods/Services", value: "IMPGS" }
                            , { label: "Exports Goods/Services", value: "EXPGS" }
                            , { label: "Unemployment Rate", value: "UNRATE" }
                            , { label: "Prime Loan Rate", value: "DPRIME" }
                            , { label: "Commercial Bank Deposits", value: "DPSACBW027SBOG" }
                            , { label: "Residential Construction $$", value: "TLRESCONS" }
                            , { label: "Residential Real Estate Loans", value: "RHEACBW027SBOG" }
                            , { label: "Consumer Price Index", value: "CPIAUCSL" }]} />
                    {s_Series != null ?
                        <button
                            className="btn btn-primary"
                            style={{ margin: "20px" }}
                            type="button"
                            onClick={GetAdjustedData}
                        >AdjustData</button>
                        :
                        <button
                            className="btn btn-primary disabled"
                            style={{ margin: "20px" }}
                            type="button"
                            disabled
                        >AdjustData</button>
                    }
                </div>
                <Table data={s_Data} title={s_adjusted ? `${s_Series} Adjusted` : `${s_Series} Raw`} />
                <div>
                    <h3>C# API method to adjust the data series</h3>
                    <p>This method takes the name of the data series as a parameter. Each series has its own stored procedure for adjusting the data.</p>
                    <SyntaxHighlighter language="csharp" style={atomOneDark}>
                        {`        public IActionResult TimeAdjustData(string l_STRseries)
        {
            //DataTable object to hold the data we are returning
            DataTable l_OBJreturnTable = new DataTable();
            l_OBJreturnTable.Columns.Add(new DataColumn("Date", Type.GetType("System.DateTime")));
            l_OBJreturnTable.Columns.Add(new DataColumn("Value", Type.GetType("System.Decimal")));

            //Call SQL stored procedure to adjust the data to match the Master dates
            using (SqlConnection l_OBJsqlConn = new SqlConnection("Server=localhost; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                SqlCommand l_OBJsqlComm = l_OBJsqlConn.CreateCommand();

                l_OBJsqlComm.CommandText = $"CapstoneUI.ins{l_STRseries}Adjusted";

                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;

                using (SqlDataReader l_OBJsqlDataRdr = l_OBJsqlComm.ExecuteReader())
                {
                    //Feed our resultant data into our Datatable
                    while (l_OBJsqlDataRdr.Read())
                    {
                        DataRow l_OBJnewRow = l_OBJreturnTable.NewRow();
                        l_OBJnewRow.SetField("Date", l_OBJsqlDataRdr.GetDateTime(0));
                        l_OBJnewRow.SetField("Value", l_OBJsqlDataRdr.GetDecimal(1));
                        l_OBJreturnTable.Rows.Add(l_OBJnewRow);
                    }
                }

                l_OBJsqlConn.Close();
            }

            //return our data to the web app
            return Ok(l_OBJreturnTable.AsEnumerable().Select(row => new
            {
                 Date = row["Date"]
                ,Value = row["Value"]
            }).ToList());
        }` }
                    </SyntaxHighlighter>
                    <h3>SQL Procedures to adjust the data in the DB</h3>
                    <p>There are two forms of the procedure, one for series with quarterly releases and one for the rest of the series.</p>
                    <p>This is what the quarterly series procedures look like.</p>
                    <SyntaxHighlighter language="sql" style={atomOneDark}>
                        {`--Adjust dates on original data so that we have common dates throughout our dataset. 
--Insert adjusted data into a new table.
CREATE PROCEDURE [CapstoneUI].[ins<seriesName>Adjusted]
AS
BEGIN

DROP TABLE IF EXISTS WGUCapstone.CapstoneUI.<seriesName>Adjusted;
CREATE TABLE WGUCapstone.CapstoneUI.<seriesName>Adjusted
(
	 AsOfDate DATE
	,<seriesName>Billions MONEY
	,IsAdjusted BIT --Bit value to represent whether or not this data is for the date listed or if it was moved forward.
);

--Get the length of time between each date and the dates from the MasterDate table
WITH DateOps (DaysDistant, <seriesName>Date, MasterDate)
AS
(
	SELECT DATEDIFF(DAY, a.AsOfDate, b.AsOfDate) AS DaysDistant
		  ,a.AsOfDate AS <seriesName>Date
		  ,b.AsOfDate AS MasterDate
	  FROM WGUCapstone.CapstoneUI.<seriesName> a
	  JOIN WGUCapstone.CapstoneUI.AsOfDateMASTER b
        ON ABS(DATEDIFF(DAY, a.AsOfDate, b.AsOfDate)) < 180
),

--Organize data by it's distance to the dates in MasterDate and give it a row number based on it's relationship to that date.
RowDate (MasterDate, <seriesName>Billions, <seriesName>Date, isAdjusted, RowNum)
AS
(
		SELECT  b.MasterDate
			   ,a.<seriesName>Billions
			   ,a.AsOfDate
			   ,CASE
			       WHEN a.AsOfDate = b.MasterDate
				   THEN 0
				   ELSE 1
			    END
			   ,ROW_NUMBER() OVER(PARTITION BY b.MasterDate ORDER BY a.AsOfDate ASC)
		  FROM WGUCapstone.CapstoneUI.<seriesName> a
		  JOIN DateOps b
			ON a.AsOfDate = b.<seriesName>Date
		   AND b.DaysDistant = (SELECT MIN(c.DaysDistant)
								  FROM DateOps c
								 WHERE c.MasterDate = b.MasterDate
								   AND c.DaysDistant >= 0
							  GROUP BY c.MasterDate)

)

--Since this data series only offers quarterly records we calculate reasonable approximations for the 2 months between each quarter-end
--We create to partitions for row numbers, one for the year and on for each quarter
,RowDiffCalc (MasterDate, <seriesName>Billions, isAdjusted, RowNumVal, RowNumYear)
AS
(
	 SELECT  MasterDate
            ,<seriesName>Billions
			,isAdjusted
			,ROW_NUMBER() OVER(PARTITION BY YEAR(MasterDate), <seriesName>Billions ORDER BY MasterDate)
			,ROW_NUMBER() OVER(PARTITION BY YEAR(MasterDate) ORDER BY MasterDate)
       FROM RowDate
      WHERE RowNum = 1
   
)

INSERT INTO WGUCapstone.CapstoneUI.<seriesName>Adjusted
     SELECT  a.MasterDate
            ,ISNULL(a.<seriesName>Billions - (a.<seriesName>Billions - (SELECT ISNULL(b.<seriesName>Billions, 0)
                                                            FROM RowDiffCalc b
							                               WHERE a.isAdjusted = 1
							                                 AND ((b.RowNumYear = a.RowNumYear + 2
							                                 AND YEAR(b.MasterDate) = YEAR(a.MasterDate))
														      OR (MONTH(a.MasterDate) IN (10, 11, 12)
														     AND YEAR(b.MasterDate) = YEAR(a.MasterDate) + 1
														     AND b.RowNumYear = a.RowNumYear - 9)))) * .33 * (a.RowNumVal - 1), a.<seriesName>Billions) AS <seriesName>Billions --To get our final value we increment each month between quarter-ends by 1/3 or the differenc between the earlier quarter and the later quarter.
		     ,a.isAdjusted
      FROM RowDiffCalc a
  ORDER BY MasterDate

--Return the adjusted dataset for review
SELECT  a.AsOfDate
	   ,a.<seriesName>Billions
  FROM WGUCapstone.CapstoneUI.<seriesName>Adjusted a
END
GO` }
                    </SyntaxHighlighter>
                    <p>This is the form of the procedure for all the other data series(they have either monthly or irregular daily releases).</p>
                    <SyntaxHighlighter language="sql" style={atomOneDark}>
                        {`--Adjust dates on original data so that we have common dates throughout our dataset. 
--Insert adjusted data into a new table.
CREATE PROCEDURE [CapstoneUI].[ins<seriesName>Adjusted]
AS
BEGIN


DROP TABLE IF EXISTS WGUCapstone.CapstoneUI.<seriesName>Adjusted;
CREATE TABLE WGUCapstone.CapstoneUI.<seriesName>Adjusted
(
	 AsOfDate DATE
	,<seriesName>Billions MONEY
	,IsAdjusted BIT --Bit value to represent whether or not this data is for the date listed or if it was moved forward.
);

--Get the length of time between each date and the dates from the MasterDate table
WITH DateOps (DaysDistant, <seriesName>Date, MasterDate)
AS
(
	SELECT DATEDIFF(DAY, a.AsOfDate, b.AsOfDate) AS DaysDistant
		  ,a.AsOfDate AS <seriesName>Date
		  ,b.AsOfDate AS MasterDate
	  FROM WGUCapstone.CapstoneUI.<seriesName> a
	  JOIN WGUCapstone.CapstoneUI.AsOfDateMASTER b
        ON ABS(DATEDIFF(DAY, a.AsOfDate, b.AsOfDate)) < 180
),

--Organize data by it's distance to the dates in MasterDate and give it a row number based on it's relationship to that date.
RowDate (MasterDate, <seriesName>Billions, <seriesName>Date, isAdjusted, RowNum)
AS
(
		SELECT  b.MasterDate
			   ,a.<seriesName>Billions
			   ,a.AsOfDate
			   ,CASE
			       WHEN a.AsOfDate = b.MasterDate
				   THEN 0
				   ELSE 1
			    END
			   ,ROW_NUMBER() OVER(PARTITION BY b.MasterDate ORDER BY a.AsOfDate ASC)
		  FROM WGUCapstone.CapstoneUI.<seriesName> a
		  JOIN DateOps b
			ON a.AsOfDate = b.<seriesName>Date
		   AND b.DaysDistant = (SELECT MIN(c.DaysDistant)
								  FROM DateOps c
								 WHERE c.MasterDate = b.MasterDate
								   AND c.DaysDistant >= 0
							  GROUP BY c.MasterDate)

)


--Insert into our new table the number 1 record from each partition over MasterDate
INSERT INTO WGUCapstone.CapstoneUI.<seriesName>Adjusted
	 SELECT  MasterDate
            ,<seriesName>Billions
			,isAdjusted
       FROM RowDate
      WHERE RowNum = 1
   ORDER BY MasterDate

--Return the adjusted dataset for review
SELECT  a.AsOfDate
	   ,a.<seriesName>Billions
  FROM WGUCapstone.CapstoneUI.<seriesName>Adjusted a
END
GO` }
                    </SyntaxHighlighter>
                </div>
            </MainContent>
        </div>
    );
}

export default AdjustData;