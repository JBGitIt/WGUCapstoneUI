USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[selGetTrees]    Script Date: 12/22/2024 8:37:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[selGetTrees]
	 @ForestID INT
	,@VersionID INT
AS
BEGIN
	SELECT  [DecisionTreeID]
		   ,[RandomForestID]
           ,[RandomForest_Version]
           ,[Depth]
           ,[MaxDepth]
           ,[MinSamplesToSplit]
           ,[isRoot]
           ,[isLeaf]
           ,[CAT_ClassValue]
           ,[NUM_ClassValue]
		   ,[FeatureIndex]
           ,[Left_DecisionTreeID]
           ,[Right_DecisionTreeID]
           ,[CAT_Threshold]
           ,[NUM_Threshold]
	  FROM WGUCapstone.CapstoneUI.DecisionTreeNode a
	 WHERE a.RandomForestID = @ForestID
	   AND a.RandomForest_Version = @VersionID
END
GO


