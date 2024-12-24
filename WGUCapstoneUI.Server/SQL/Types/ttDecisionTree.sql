USE [WGUCapstone]
GO

/****** Object:  UserDefinedTableType [dbo].[ttDecisionTree]    Script Date: 12/23/2024 7:28:35 PM ******/
CREATE TYPE [dbo].[ttDecisionTree] AS TABLE(
	[RandomForestID] [int] NULL,
	[RandomForest_Version] [int] NULL,
	[Depth] [int] NULL,
	[MaxDepth] [int] NULL,
	[MinSamplesToSplit] [int] NULL,
	[isRoot] [bit] NULL,
	[isLeaf] [bit] NULL,
	[CAT_ClassValue] [nvarchar](max) NULL,
	[NUM_ClassValue] [decimal](18, 2) NULL,
	[FeatureIndex] [int] NULL,
	[Left_DecisionTreeID] [int] NULL,
	[Right_DecisionTreeID] [int] NULL,
	[CAT_Threshold] [nvarchar](max) NULL,
	[NUM_Threshold] [decimal](18, 2) NULL
)
GO


