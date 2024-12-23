USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insIMPGS]    Script Date: 12/22/2024 8:36:02 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insIMPGS]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO IMPGS (AsOfDate, IMPGSBillions)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


