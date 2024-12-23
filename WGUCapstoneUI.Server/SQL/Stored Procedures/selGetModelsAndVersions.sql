USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[selGetModelsAndVersions]    Script Date: 12/22/2024 8:36:53 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [CapstoneUI].[selGetModelsAndVersions]
AS
BEGIN
	SELECT  a.RandomForestID
	       ,a.Version
		   ,a.VersionDate
		   ,a.ValidationAccuracy
	  FROM CapstoneUI.RandomForest a
END
GO


