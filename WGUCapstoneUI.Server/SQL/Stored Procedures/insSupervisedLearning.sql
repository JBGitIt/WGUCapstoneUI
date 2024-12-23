USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insSupervisedLearning]    Script Date: 12/22/2024 8:36:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO





CREATE PROCEDURE [CapstoneUI].[insSupervisedLearning]
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
	  JOIN WGUCapstone.CapstoneUI.UNRATEAdjusted k
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
GO


