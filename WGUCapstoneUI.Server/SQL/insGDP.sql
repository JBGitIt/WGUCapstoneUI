USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insGDP]    Script Date: 12/22/2024 8:35:53 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insGDP]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO GDP (AsOfDate, GDPBillions)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


