USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insCPIAUCSL]    Script Date: 12/22/2024 8:35:10 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insCPIAUCSL]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO CPIAUCSL (AsOfDate, CPIAUCSL)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


