USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[CPIAUCSLAdjusted]    Script Date: 12/22/2024 8:49:21 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[CPIAUCSLAdjusted](
	[AsOfDate] [date] NULL,
	[CPIAUCSL] [money] NULL,
	[IsAdjusted] [bit] NULL
) ON [PRIMARY]
GO


