import React, { useState, useEffect } from 'react';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import Table from '../Components/Table';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
function RawData() {
    const [s_Series, s_setSeries] = useState("GDP");
    const [s_Data, s_setData] = useState("Loading");

    useEffect(() => {
        s_setData("Loading");
        async function GetData() {
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

        GetData();
    }, [s_Series]);


    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Data", label: "Data Explanation" }
                , { link: "/Data/AdjustData", label: "Cleaning the Data" }
                , { link: "/Data/DataPrep", label: "Prepping the Data" }
                , { link: "/Data/DataVisualization", label: "Visualizing the Data" }
                , { link: "/Data/Hypothesis", label: "Hypothesis Resolution" }
            ]} />
            <MainContent>
            <h3>Raw Data from DB</h3>
                <Dropdown
                    updateValue={s_setSeries}
                    defaultStateValue={{ label: "USA GDP", value: "GDP" }}
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
                <Table data={s_Data} title={s_Series} />
                <div>
                    <p>
                        The full code of the API and all its methods is available in the GitHub repository GITHUBLINK. Below is select code from the API pertinent to the extraction of raw data.
                    </p>
                    <h3>API Method for Data Extraction</h3>
                    <SyntaxHighlighter language="csharp" style={atomOneDark}>
                        {`public IActionResult GetRawData(string l_STRseries)
        {
            //DataTable for sending our extracted data to the DB
            DataTable l_OBJtable = new DataTable();
            l_OBJtable.Columns.Add("Date", Type.GetType("System.String"));
            l_OBJtable.Columns.Add("Value", Type.GetType("System.Double"));

            HashSet<KeyValuePair<string, double>> l_COLLobservations = new HashSet<KeyValuePair<string, double>>();

            //HttpRequest to FRED API
            using (HttpClient l_OBJclient = new HttpClient())
            {
                HttpResponseMessage l_OBJresponse = l_OBJclient.GetAsync($"https://api.stlouisfed.org/fred/series/observations?series_id={l_STRseries}&sort_order=asc&api_key={l_STRapiKey}&file_type=json").GetAwaiter().GetResult();

                //Parse the returned JSON into custom classes
                FREDOut l_OBJapiOutput = JsonConvert.DeserializeObject<FREDOut>(l_OBJresponse.Content.ReadAsStringAsync().GetAwaiter().GetResult());

                //Parse the necessary information from the resultant objects
                double l_DBLvalue = 0;
                DateTime l_OBJdt = DateTime.Now;
                l_COLLobservations = l_OBJapiOutput.observations.Where(row => { return (double.TryParse(row.value, out l_DBLvalue) && DateTime.TryParse(row.date, out l_OBJdt)); })
                    .Select(row =>
                    {
                        return new KeyValuePair<string, double>(DateTime.Parse(row.date).ToShortDateString(), double.Parse(row.value));
                    }).ToHashSet();

                //Turn it into DataRows in our DataTable so we can send it off to the DB
                foreach (KeyValuePair<string, double> kvp in l_COLLobservations)
                {
                    l_OBJtable.Rows.Add(new object[] { kvp.Key, kvp.Value });
                }
            }

            //Connect to the SQL DB
            using (SqlConnection l_OBJsqlConn = new SqlConnection("Server=localhost; Database=WGUCapstone; Integrated Security=True; Trust Server Certificate=True"))
            {
                l_OBJsqlConn.Open();

                //Use procedure that accepts table parameter to send our data over
                SqlCommand l_OBJsqlComm = new SqlCommand($"CapstoneUI.ins{l_STRseries}", l_OBJsqlConn);
                l_OBJsqlComm.Parameters.Add(new SqlParameter("@apiRecord", l_OBJtable));
                l_OBJsqlComm.CommandType = CommandType.StoredProcedure;
                int l_INTrowsOut = l_OBJsqlComm.ExecuteNonQuery();
            }

            //Return the data to the caller of our method
            return Ok(l_OBJtable.AsEnumerable().Select((row) => new
            {
                 Date = row["Date"]
                ,Value = row["Value"]
            }).ToList());
        }
` }
                    </SyntaxHighlighter>
                    <h3>C# Custom Class for Output</h3>
                    <SyntaxHighlighter language="csharp" style={atomOneDark}>
                        {`class FREDOut
    {
        public string realtime_start;
        public string realtime_end;
        public string observation_start;
        public string observation_end;
        public string units;
        public string output_type;
        public string file_type;
        public string order_by;
        public string sort_order;
        public int count;
        public int offset;
        public int limit;
        public List<FREDobs> observations;
    }` }
                    </SyntaxHighlighter>
                    <h3>SQL Stored Procedure</h3>
                    <p>*The T-SQL has been generalized, there are specific tables and procedures for each dataset we extract.*</p>
                    <SyntaxHighlighter language="sql" style={atomOneDark}>
                        {`USE [WGUCapstone]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ins<tableName>]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO <tableName> (AsOfDate, <valueColumnName>)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END` }
                    </SyntaxHighlighter>
                    <h3>SQL Table Structure</h3>
                    <SyntaxHighlighter language="sql" style={atomOneDark}>
                        {`USE [WGUCapstone]
GO

/****** Object:  Table [dbo].[BUSLOANS]    Script Date: 12/14/2024 2:23:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[<dataSeriesName>](
	[AsOfDate] [date] NULL,
	[<valueColumnName>] [money] NULL
) ON [PRIMARY]
GO


`}
                    </SyntaxHighlighter>
                    <p>*The T-SQL has been generalized, there are specific tables and procedures for each dataset we extract.*</p>
                </div>
            </MainContent>
        </div>
    );
}

export default RawData;