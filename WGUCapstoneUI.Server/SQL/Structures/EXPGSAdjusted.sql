USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[EXPGSAdjusted]    Script Date: 12/22/2024 8:50:03 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[EXPGSAdjusted](
	[AsOfDate] [date] NULL,
	[EXPGSBillions] [money] NULL,
	[IsAdjusted] [bit] NULL
) ON [PRIMARY]
GO


