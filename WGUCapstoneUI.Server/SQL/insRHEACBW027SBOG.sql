USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insRHEACBW027SBOG]    Script Date: 12/22/2024 8:36:16 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insRHEACBW027SBOG]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO RHEACBW027SBOG(AsOfDate, RHEACBW027SBOGBillions)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


