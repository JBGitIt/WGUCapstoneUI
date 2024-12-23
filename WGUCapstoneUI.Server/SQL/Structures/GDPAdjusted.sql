USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[GDPAdjusted]    Script Date: 12/22/2024 8:50:12 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[GDPAdjusted](
	[AsOfDate] [date] NULL,
	[GDPBillions] [money] NULL,
	[IsAdjusted] [bit] NULL
) ON [PRIMARY]
GO


