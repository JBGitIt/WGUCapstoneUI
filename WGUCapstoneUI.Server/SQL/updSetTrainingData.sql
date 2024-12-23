USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[updSetTrainingData]    Script Date: 12/22/2024 8:38:22 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




/****** Object:  Table [CapstoneUI].[SupervisedLearning]    Script Date: 11/24/2024 12:13:49 PM ******/
CREATE PROCEDURE [CapstoneUI].[updSetTrainingData]
	 @TrainingDates ttTrainingList READONLY
	,@OriginalTraining BIT
	,@ForestID INT = NULL
	,@isValidationCorrect BIT = NULL
AS
BEGIN

	IF @ForestID IS NULL
	BEGIN
		INSERT INTO CapstoneUI.RandomForest (Version, VersionDate)
		     VALUES (1, SYSDATETIME())

		DECLARE @newRFid INT = SCOPE_IDENTITY();

		INSERT INTO CapstoneUI.RandomForest_SupervisedLearning (RandomForestID, RandomForest_Version, SupervisedLearning_T2_Date, isOriginalTraining, isValidationCorrect)
		SELECT  @newRFid
		       ,1
			   ,a.T2_Date
			   ,1
			   ,NULL
	      FROM @TrainingDates a

		SELECT @newRFid, 1;
	END

	ELSE
	BEGIN
		DECLARE @newVerID INT = (SELECT MAX(a.Version) + 1
		                           FROM CapstoneUI.RandomForest a
							      WHERE a.RandomForestID = @ForestID)

		SET IDENTITY_INSERT CapstoneUI.RandomForest ON
		INSERT INTO CapstoneUI.RandomForest (RandomForestID, Version, VersionDate)
		     VALUES (@ForestID, @newVerID, SYSDATETIME())
	    SET IDENTITY_INSERT CapstoneUI.RandomForest OFF

        INSERT INTO CapstoneUI.RandomForest_SupervisedLearning (RandomForestID, RandomForest_Version, SupervisedLearning_T2_Date, isOriginalTraining, isValidationCorrect)
		SELECT  @ForestID
		       ,@newVerID
			   ,a.SupervisedLearning_T2_Date
			   ,a.isOriginalTraining
			   ,a.isValidationCorrect
		  FROM RandomForest_SupervisedLearning a
		 WHERE a.RandomForestID = @ForestID
		   AND a.RandomForest_Version = @newVerID - 1

        INSERT INTO CapstoneUI.RandomForest_SupervisedLearning (RandomForestID, RandomForest_Version, SupervisedLearning_T2_Date, isOriginalTraining, isValidationCorrect)       
		SELECT  @ForestID
		       ,@newVerID
			   ,a.T2_Date
			   ,0
			   ,@isValidationCorrect
		  FROM @TrainingDates a

		SELECT @ForestID, @newVerID;
	END
	--UPDATE a
	--   SET a.isTrainingData = 0
	--  FROM CapstoneUI.SupervisedLearning a

	--UPDATE a
	--   SET a.isTrainingData = 1
	--  FROM CapstoneUI.SupervisedLearning a
	--  JOIN @TrainingDates b
	--    ON a.T2_Date = b.T2_Date
END


GO


