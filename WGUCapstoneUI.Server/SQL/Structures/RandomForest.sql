USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[RandomForest]    Script Date: 12/22/2024 8:50:27 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[RandomForest](
	[RandomForestID] [int] IDENTITY(1,1) NOT NULL,
	[Version] [int] NOT NULL,
	[VersionDate] [date] NULL,
	[ValidationAccuracy] [decimal](5, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[RandomForestID] ASC,
	[Version] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


