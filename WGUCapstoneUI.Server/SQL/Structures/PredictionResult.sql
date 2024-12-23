USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[PredictionResult]    Script Date: 12/22/2024 8:50:23 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[PredictionResult](
	[RandomForestID] [int] NOT NULL,
	[Version] [int] NOT NULL,
	[AsOfDate] [date] NULL,
	[PredictedGDP] [money] NULL,
	[RangeHigh] [money] NULL,
	[RangeLow] [money] NULL,
	[Actual] [money] NULL,
	[isCorrect] [bit] NULL
) ON [PRIMARY]
GO

ALTER TABLE [CapstoneUI].[PredictionResult]  WITH CHECK ADD  CONSTRAINT [FK__PredictionResult__2EA5EC27] FOREIGN KEY([RandomForestID], [Version])
REFERENCES [CapstoneUI].[RandomForest] ([RandomForestID], [Version])
ON UPDATE CASCADE
ON DELETE CASCADE
GO

ALTER TABLE [CapstoneUI].[PredictionResult] CHECK CONSTRAINT [FK__PredictionResult__2EA5EC27]
GO


