USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[selGetValidationResults]    Script Date: 12/22/2024 8:37:50 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[selGetValidationResults] 
     @ForestID INT
	,@Version INT
AS
BEGIN
	SELECT  a.AsOfDate
	       ,a.PredictedGDP
		   ,a.RangeHigh
		   ,a.RangeLow
		   ,a.Actual
		   ,a.isCorrect
	  FROM CapstoneUI.PredictionResult a
	 WHERE a.RandomForestID = @ForestID
	   AND a.Version = @Version

	DECLARE  @CorrectPredictions INT = (SELECT COUNT(*) FROM CapstoneUI.PredictionResult a WHERE a.isCorrect = 1 AND a.RandomForestID = @ForestID AND a.Version = @Version)
			,@TotalPredictions INT = (SELECT COUNT(*) FROM CapstoneUI.PredictionResult a WHERE a.RandomForestID = @ForestID AND a.Version = @Version)
	SELECT (CONVERT(DECIMAL, @CorrectPredictions) / @TotalPredictions ) * 100
END
GO


