USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insUNRATE]    Script Date: 12/22/2024 8:36:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insUNRATE]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO UNRATE (AsOfDate, UNRATEPercent)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


