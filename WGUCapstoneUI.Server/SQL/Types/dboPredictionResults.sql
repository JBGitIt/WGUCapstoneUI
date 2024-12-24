USE [WGUCapstone]
GO

/****** Object:  UserDefinedTableType [dbo].[PredictionResults]    Script Date: 12/23/2024 7:28:29 PM ******/
CREATE TYPE [dbo].[PredictionResults] AS TABLE(
	[ModelID] [int] NULL,
	[AsOfDate] [date] NULL,
	[PredictedGDP] [money] NULL,
	[RangeHigh] [money] NULL,
	[RangeLow] [money] NULL,
	[Actual] [money] NULL,
	[isCorrect] [bit] NULL
)
GO


