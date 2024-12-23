USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[BUSLOANSAdjusted]    Script Date: 12/22/2024 8:49:12 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[BUSLOANSAdjusted](
	[AsOfDate] [date] NULL,
	[BUSLOANSBillions] [money] NULL,
	[IsAdjusted] [bit] NULL
) ON [PRIMARY]
GO


