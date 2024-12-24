USE [WGUCapstone]
GO

/****** Object:  UserDefinedTableType [dbo].[apiRecord]    Script Date: 12/23/2024 7:28:23 PM ******/
CREATE TYPE [dbo].[apiRecord] AS TABLE(
	[date] [date] NULL,
	[value] [decimal](12, 2) NULL
)
GO


