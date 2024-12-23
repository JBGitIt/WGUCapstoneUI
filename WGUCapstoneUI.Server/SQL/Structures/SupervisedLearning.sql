USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[SupervisedLearning]    Script Date: 12/22/2024 8:50:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[SupervisedLearning](
	[T1_Date] [date] NULL,
	[T1_BUSLOANSBillions] [money] NULL,
	[T1_CPIAUCSL] [money] NULL,
	[T1_DPRIMEPercent] [money] NULL,
	[T1_DPSACBW027SBOGBillions] [money] NULL,
	[T1_EXPGSBillions] [money] NULL,
	[T1_IMPGSBillions] [money] NULL,
	[T1_RHEACBW027SBOGBillions] [money] NULL,
	[T1_TLRESCONBillions] [money] NULL,
	[T1_UNRATEPercent] [decimal](5, 2) NULL,
	[T1_GDPBillions] [money] NULL,
	[T2_Date] [date] NOT NULL,
	[T2_BUSLOANSBillions] [money] NULL,
	[T2_BUSLOANSPercentChange] [decimal](6, 3) NULL,
	[T2_CPIAUCSL] [money] NULL,
	[T2_CPIAUCSLPercentChange] [decimal](6, 3) NULL,
	[T2_DPRIMEPercent] [money] NULL,
	[T2_DPRIMEPercentChange] [decimal](6, 3) NULL,
	[T2_DPSACBW027SBOGBillions] [money] NULL,
	[T2_DPSACBW027SBOGPercentChange] [decimal](6, 3) NULL,
	[T2_EXPGSBillions] [money] NULL,
	[T2_EXPGSPercentChange] [decimal](6, 3) NULL,
	[T2_IMPGSBillions] [money] NULL,
	[T2_IMPGSPercentChange] [decimal](6, 3) NULL,
	[T2_RHEACBW027SBOGBillions] [money] NULL,
	[T2_RHEACBW027SBOGPercentChange] [decimal](6, 3) NULL,
	[T2_TLRESCONBillions] [money] NULL,
	[T2_TLRESCONPercentChange] [decimal](6, 3) NULL,
	[T2_UNRATEPercent] [decimal](5, 2) NULL,
	[T2_UNRATEPercentChange] [decimal](6, 3) NULL,
	[T2_GDPBillions] [money] NULL,
	[T2_GDPPercentChange] [decimal](6, 3) NULL,
	[T3_GDPBillions] [money] NULL,
	[T3_GDPPercentChange] [decimal](6, 3) NULL,
 CONSTRAINT [PK_SupervisedLearning] PRIMARY KEY CLUSTERED 
(
	[T2_Date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


