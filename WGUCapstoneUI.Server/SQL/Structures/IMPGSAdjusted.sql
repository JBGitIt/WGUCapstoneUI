USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[IMPGSAdjusted]    Script Date: 12/22/2024 8:50:19 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[IMPGSAdjusted](
	[AsOfDate] [date] NULL,
	[IMPGSBillions] [money] NULL,
	[IsAdjusted] [bit] NULL
) ON [PRIMARY]
GO


