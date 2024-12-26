import React, { useState, useEffect } from 'react';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import Table from '../Components/Table';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
function AdjustData() {
	const [s_Data, s_setData] = useState();

	const isProduction = process.env.NODE_ENV === 'production';
	const APIprefix = isProduction ? '/CapstoneUIAPI/' : '/';

	async function PrepData() {
        s_setData("Loading");
        async function GetData() {
            try {
                const response = await fetch(`${APIprefix}ML/suplearn`);
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
	};

    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Data", label: "Data Explanation" }
                , { link: "/Data/RawData", label: "Raw Data Extract" }
                , { link: "/Data/AdjustData", label: "Cleaning the Data" }
                , { link: "/Data/DataVisualization", label: "Visualizing the Data" }
                , { link: "/Data/Hypothesis", label: "Hypothesis Resolution" }
            ]} />
			<MainContent>
				<button
					className="btn btn-primary"
					style={{ margin: "20px" }}
					type="button"
					onClick={PrepData}
				>Prep Data!</button>
                <Table data={s_Data} title="Supervised Learning" />
                <div>
                    <h3>Prepping the Data for the model</h3>
                    <p>The following SQL statements prep the cleaned data for use by the model. We have to turn our time series data into a supervised learning problem.
                       To do this we have two lagged sets of data for where the prediction for time period T is based on data from T-2 (including GDP) and T-1 (including GDP).
                       Theoretically, because of the way we construct our training and validation data, we could attempt predicitions of any value in our datasets but we are focusing on GDP.
					</p>
					<SyntaxHighlighter language="sql" style={atomOneDark}>
						{`CREATE PROCEDURE [CapstoneUI].[insSupervisedLearning]
AS
BEGIN

DELETE FROM [CapstoneUI].[SupervisedLearning];

WITH RowNum(AsOfDate, RowNum, BUSLOANSBillions, CPIAUCSL, DPRIMEPercent, DPSACBW027SBOGBillions, EXPGSBillions, GDPBillions, IMPGSBillions, RHEACBW027SBOGBillions, TLRESCONSBillions, UNRATEPercent)
AS
(
	SELECT  a.AsOfDate
		   ,ROW_NUMBER() OVER(ORDER BY a.AsOfDate ASC) AS RowNum
		   ,b.BUSLOANSBillions
		   ,c.CPIAUCSL
		   ,d.DPRIMEPercent
		   ,e.DPSACBW027SBOGBillions
		   ,f.EXPGSBillions
		   ,g.GDPBillions
		   ,h.IMPGSBillions
		   ,i.RHEACBW027SBOGBillions
		   ,j.TLRESCONSMillions
		   ,k.UNRATEPercent
	  FROM WGUCapstone.CapstoneUI.AsOfDateMASTER a
	  JOIN WGUCapstone.CapstoneUI.BUSLOANSAdjusted b
		ON a.AsOfDate = b.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.CPIAUCSLAdjusted c
		ON a.AsOfDate = c.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.DPRIMEAdjusted d
		ON a.AsOfDate = d.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.DPSACBW027SBOGAdjusted e
		ON a.AsOfDate = e.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.EXPGSAdjusted f
		ON a.AsOfDate = f.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.GDPAdjusted g
		ON a.AsOfDate = g.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.IMPGSAdjusted h
		ON a.AsOfDate = h.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.RHEACBW027SBOGAdjusted i
		ON a.AsOfDate = i.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.TLRESCONSAdjusted j
		ON a.AsOfDate = j.AsOfDate
	  JOIN WGUCapstone.CapstoneUI.UNRATE k
		ON a.AsOfDate = k.AsOfDate
)

INSERT INTO WGUCapstone.CapstoneUI.SupervisedLearning
     SELECT  a.AsOfDate AS DateT1
			,a.BUSLOANSBILLIONS AS BUSLOANSBillionsT1
	        ,a.CPIAUCSL AS CPIAUCSLT1
	        ,a.DPRIMEPercent AS DPRIMEPercentT1
	        ,a.DPSACBW027SBOGBillions AS DPSACBW027SBOGBillionsT1
	        ,a.EXPGSBillions AS EXPGSBillionsT1
	        ,a.IMPGSBillions AS IMPGSBillionsT1
	        ,a.RHEACBW027SBOGBillions AS RHEACBW027SBOGBillionsT1
			,a.TLRESCONSBillions AS TLRESCONSBillionsT1
			,a.UNRATEPercent AS UNRATEPercentT1
	        ,a.GDPBillions AS GDPBillionsT1
			,b.AsOfDate AS DateT2
	        ,b.BUSLOANSBILLIONS AS BUSLOANSBillionsT2
			,(1 - a.BUSLOANSBillions / b.BUSLOANSBillions) * 100 AS BUSLOANSPercentChange
	        ,b.CPIAUCSL AS CPIAUCSLT2
			,(1 - a.CPIAUCSL / b.CPIAUCSL) * 100 AS CPIAUCSLPercentChange
	        ,b.DPRIMEPercent AS DPRIMEPercentT2
			,b.DPRIMEPercent - a.DPRIMEPercent AS DPRIMEPercentChange
	        ,b.DPSACBW027SBOGBillions AS DPSACBW027SBOGBillionsT2
			,(1 - a.DPSACBW027SBOGBillions / b.DPSACBW027SBOGBillions) * 100 AS DPSACBW027SBOGPercentChange
	        ,b.EXPGSBillions AS EXPGSBillionsT2
			,(1 - a.EXPGSBillions / b.EXPGSBillions) * 100 AS EXPGSPercentChange
	        ,b.IMPGSBillions AS IMPGSBillionsT2
			,(1 - a.IMPGSBillions / b.IMPGSBillions) * 100 AS IMPGSPercentChange
	        ,b.RHEACBW027SBOGBillions AS RHEACBW027SBOGBillionsT2
			,(1 - a.RHEACBW027SBOGBillions / b.RHEACBW027SBOGBillions) * 100 AS RHEACBW027SBOGPercentChange
			,b.TLRESCONSBillions AS TLRESCONSBillionsT2
			,(1 - a.TLRESCONSBillions / b.TLRESCONSBillions) * 100 AS TLRESCONSPercentChange
			,b.UNRATEPercent AS UNRATEPercentT2
			,b.UNRATEPercent - a.UNRATEPercent AS UNRATEPercentChange
	        ,b.GDPBillions AS GDPBillionsT2
			,(1 - a.GDPBillions / b.GDPBillions) * 100 AS GDPPercentChangeT2
			,c.GDPBillions AS GDPBillionsT3
			,(1 - b.GDPBillions / c.GDPBillions) * 100 AS GDPPercentChangeT3
       FROM RowNum a
  LEFT JOIN RowNum b
         ON b.RowNum = a.RowNum + 1
  LEFT JOIN RowNum c
         ON c.RowNum = a.RowNum + 2
  WHERE b.AsOfDate IS NOT NULL

SELECT * FROM WGUCapstone.CapstoneUI.SupervisedLearning
 WHERE T3_GDPBillions IS NOT NULL
END
GO` }
                    </SyntaxHighlighter>
                </div>
            </MainContent>
        </div>
    );
}

export default AdjustData;