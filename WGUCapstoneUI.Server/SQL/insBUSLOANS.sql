USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insBUSLOANS]    Script Date: 12/22/2024 8:35:00 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insBUSLOANS]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO BUSLOANS (AsOfDate, BUSLOANSBillions)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


