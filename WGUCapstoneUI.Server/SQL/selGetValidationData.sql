USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[selGetValidationData]    Script Date: 12/22/2024 8:37:46 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [CapstoneUI].[selGetValidationData]
	 @ForestID INT
	,@VersionID INT
AS
BEGIN
		SELECT a.*
		  FROM WGUCapstone.CapstoneUI.SupervisedLearning a
	 LEFT JOIN WGUCapstone.CapstoneUI.RandomForest_SupervisedLearning b
	        ON a.T2_Date = b.SupervisedLearning_T2_Date
		   AND b.RandomForestID = @ForestID
		   AND b.RandomForest_Version = @VersionID
		 WHERE b.RandomForest_Version IS NULL
		   AND T3_GDPBillions IS NOT NULL
	  ORDER BY a.T2_Date ASC
END
GO


