USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insEXPGS]    Script Date: 12/22/2024 8:35:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insEXPGS]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO EXPGS (AsOfDate, EXPGSBillions)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


