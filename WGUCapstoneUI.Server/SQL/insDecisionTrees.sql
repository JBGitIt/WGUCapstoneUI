USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insDecisionTrees]    Script Date: 12/22/2024 8:35:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




CREATE PROCEDURE [CapstoneUI].[insDecisionTrees]
	@DecisionTrees ttDecisionTree READONLY
AS
BEGIN

	INSERT INTO CapstoneUI.DecisionTreeNode
	SELECT  a.RandomForestID
	       ,a.RandomForest_Version
		   ,a.Depth
		   ,a.MaxDepth
		   ,a.MinSamplesToSplit
		   ,a.isRoot
		   ,a.isLeaf
		   ,a.CAT_ClassValue
		   ,a.NUM_ClassValue
		   ,a.FeatureIndex
		   ,a.Left_DecisionTreeID
		   ,a.Right_DecisionTreeID
		   ,a.CAT_Threshold
		   ,a.NUM_Threshold
	  FROM @DecisionTrees a

	  SELECT SCOPE_IDENTITY()
END
GO


