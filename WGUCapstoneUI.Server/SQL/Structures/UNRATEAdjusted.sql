USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[UNRATEAdjusted]    Script Date: 12/22/2024 8:51:13 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[UNRATEAdjusted](
	[AsOfDate] [date] NULL,
	[UNRATEPercent] [money] NULL,
	[IsAdjusted] [bit] NULL
) ON [PRIMARY]
GO


