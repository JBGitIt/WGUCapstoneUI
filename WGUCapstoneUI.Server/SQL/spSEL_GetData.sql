USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[spSEL_GetData]    Script Date: 12/22/2024 8:38:17 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO





CREATE PROCEDURE [CapstoneUI].[spSEL_GetData]
AS
BEGIN

	SELECT *
	  FROM WGUCapstone.CapstoneUI.SupervisedLearning
	 WHERE T1_GDPBillions IS NOT NULL
	   AND T2_GDPBillions IS NOT NULL
	   AND T3_GDPBillions IS NOT NULL
  ORDER BY T1_Date

END
GO


