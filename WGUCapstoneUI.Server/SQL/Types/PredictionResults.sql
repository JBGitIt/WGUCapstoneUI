USE [WGUCapstone]
GO

/****** Object:  UserDefinedTableType [CapstoneUI].[PredictionResults]    Script Date: 12/23/2024 7:28:16 PM ******/
CREATE TYPE [CapstoneUI].[PredictionResults] AS TABLE(
	[RandomForestID] [int] NULL,
	[Version] [int] NULL,
	[AsOfDate] [date] NULL,
	[PredictedGDP] [money] NULL,
	[RangeHigh] [money] NULL,
	[RangeLow] [money] NULL,
	[Actual] [money] NULL,
	[isCorrect] [bit] NULL
)
GO


