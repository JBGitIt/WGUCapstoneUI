USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insTLRESCONS]    Script Date: 12/22/2024 8:36:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insTLRESCONS]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO TLRESCONS(AsOfDate, TLRESCONSMillions)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


