USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[InsPredictionResults]    Script Date: 12/22/2024 8:36:11 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [CapstoneUI].[InsPredictionResults]
	@PredictionResults CapstoneUI.PredictionResults READONLY
AS
BEGIN
   INSERT INTO PredictionResult (RandomForestID, Version, AsOfDate, PredictedGDP, RangeHigh, RangeLow, Actual, isCorrect)
	    SELECT  a.RandomForestID
			   ,(SELECT MAX(b.Version) FROM CapstoneUI.RandomForest b WHERE a.RandomForestID = b.RandomForestID) AS Version
		       ,a.AsOfDate
			   ,a.PredictedGDP
			   ,a.RangeHigh
			   ,a.RangeLow
			   ,a.Actual
			   ,a.isCorrect
	      FROM @PredictionResults a
END
GO


