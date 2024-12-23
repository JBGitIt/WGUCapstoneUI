USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[GetMostRecentSupLearn]    Script Date: 12/22/2024 8:34:55 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [CapstoneUI].[GetMostRecentSupLearn]
AS
BEGIN
	SELECT TOP 1 [T2_Date] AS T1_Date
		  ,[T2_BUSLOANSBillions] AS T1_BUSLOANSBillions
		  ,[T2_CPIAUCSL] AS T1_CPIAUCSL
		  ,[T2_DPRIMEPercent] AS T1_DPRIMEPercent
		  ,[T2_DPSACBW027SBOGBillions] AS T1_DPSACBW027SBOGBillions
		  ,[T2_EXPGSBillions] AS T1_EXPGSBillions
		  ,[T2_IMPGSBillions] AS T1_IMPGSBillions
		  ,[T2_RHEACBW027SBOGBillions] AS T1_RHEACBW027SBOGBillions
		  ,[T2_TLRESCONBillions] AS T1_TLRESCONBillions
		  ,[T2_UNRATEPercent] AS T1_UNRATEPercent
		  ,[T2_GDPBillions] AS T1_GDPBillions
	  FROM [WGUCapstone].[CapstoneUI].[SupervisedLearning] a
	 WHERE a.T3_GDPBillions IS NOT NULL
  ORDER BY T2_Date DESC
END
GO


