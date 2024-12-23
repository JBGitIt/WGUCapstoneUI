USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insDPRIME]    Script Date: 12/22/2024 8:35:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insDPRIME]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO DPRIME (AsOfDate, DPRIMEPercent)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


