USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[selMostRecentDate]    Script Date: 12/22/2024 8:38:11 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [CapstoneUI].[selMostRecentDate]
AS
BEGIN
	DECLARE @MostRecentDate DATE = (SELECT TOP 1 AsOfDate
	                                      FROM CapstoneUI.AsOfDateMASTER
								      ORDER BY AsOfDate DESC)

	SELECT  a.T2_Date
	       ,a.T2_BUSLOANSBillions AS BUSLOANS
		   ,a.T2_BUSLOANSPercentChange
		   ,a.T2_CPIAUCSL AS CPIAUCSL
		   ,a.T2_CPIAUCSLPercentChange
		   ,a.T2_DPRIMEPercent AS DPRIME
		   ,a.T2_DPRIMEPercentChange
		   ,a.T2_DPSACBW027SBOGBillions AS DPSACBW027SBOG
		   ,a.T2_DPSACBW027SBOGPercentChange
		   ,a.T2_EXPGSBillions AS EXPGS
		   ,a.T2_EXPGSPercentChange
		   ,a.T2_IMPGSBillions AS IMPGS
		   ,a.T2_IMPGSPercentChange
		   ,a.T2_RHEACBW027SBOGBillions AS RHEACBW027SBOG
		   ,a.T2_RHEACBW027SBOGPercentChange
		   ,a.T2_TLRESCONBillions AS TLRESCON
		   ,a.T2_TLRESCONPercentChange
		   ,a.T2_UNRATEPercent AS UNRATE
		   ,a.T2_UNRATEPercentChange
		   ,a.T2_GDPBillions AS GDP
		   ,a.T2_GDPPercentChange
	  FROM CapstoneUI.SupervisedLearning a
	 WHERE a.T2_Date = @MostRecentDate

	 SELECT @MostRecentDate
END
GO


