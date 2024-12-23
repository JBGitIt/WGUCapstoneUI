USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insDPSACBW027SBOG]    Script Date: 12/22/2024 8:35:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [CapstoneUI].[insDPSACBW027SBOG]
	@apiRecord apiRecord READONLY
AS
BEGIN
	INSERT INTO DPSACBW027SBOG (AsOfDate, DPSACBW027SBOGBillions)
	SELECT  date
	       ,value
	  FROM @apiRecord;
END
GO


