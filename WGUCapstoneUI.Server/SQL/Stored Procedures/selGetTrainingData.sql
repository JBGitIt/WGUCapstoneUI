USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[selGetTrainingData]    Script Date: 12/22/2024 8:37:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [CapstoneUI].[selGetTrainingData]
	 @ForestID INT
	,@VersionID INT
AS
BEGIN
	SELECT a.*
	  FROM WGUCapstone.CapstoneUI.SupervisedLearning a
	  JOIN WGUCapstone.CapstoneUI.RandomForest_SupervisedLearning b
	    ON a.T2_Date = b.SupervisedLearning_T2_Date
	   AND b.RandomForestID = @ForestID
	   AND b.RandomForest_Version = @VersionID
END
GO


