USE [WGUCapstone]
GO

/****** Object:  StoredProcedure [CapstoneUI].[insGDPAdjusted]    Script Date: 12/22/2024 8:35:57 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



--Adjust dates on original data so that we have common dates throughout our dataset. 
--Insert adjusted data into a new table.
CREATE PROCEDURE [CapstoneUI].[insGDPAdjusted]
AS
BEGIN

DROP TABLE IF EXISTS WGUCapstone.CapstoneUI.GDPAdjusted;
DROP TABLE IF EXISTS #DateOps;
CREATE TABLE WGUCapstone.CapstoneUI.GDPAdjusted
(
	 AsOfDate DATE
	,GDPBillions MONEY
	,IsAdjusted BIT --Bit value to represent whether or not this data is for the date listed or if it was moved forward.
);

--Get the length of time between each date and the dates from the MasterDate table

	SELECT DATEDIFF(DAY, a.AsOfDate, b.AsOfDate) AS DaysDistant
		  ,a.AsOfDate AS GDPDate
		  ,b.AsOfDate AS MasterDate
	  INTO #DateOps
	  FROM WGUCapstone.CapstoneUI.GDP a
	  JOIN WGUCapstone.CapstoneUI.AsOfDateMASTER b
        ON ABS(DATEDIFF(DAY, a.AsOfDate, b.AsOfDate)) < 180;


--Organize data by it's distance to the dates in MasterDate and give it a row number based on it's relationship to that date.
WITH RowDate (MasterDate, GDPBillions, GDPDate, isAdjusted, RowNum)
AS
(
		SELECT  b.MasterDate
			   ,a.GDPBillions
			   ,a.AsOfDate
			   ,CASE
			       WHEN a.AsOfDate = b.MasterDate
				   THEN 0
				   ELSE 1
			    END
			   ,ROW_NUMBER() OVER(PARTITION BY b.MasterDate ORDER BY a.AsOfDate ASC)
		  FROM WGUCapstone.CapstoneUI.GDP a
		  JOIN #DateOps b
			ON a.AsOfDate = b.GDPDate
		   AND b.DaysDistant = (SELECT MIN(c.DaysDistant)
								  FROM #DateOps c
								 WHERE c.MasterDate = b.MasterDate
								   AND c.DaysDistant >= 0
							  GROUP BY c.MasterDate)

)
 --SELECT * FROM RowDate
--Since this data series only offers quarterly records we calculate reasonable approximations for the 2 months between each quarter-end
--We create to partitions for row numbers, one for the year and on for each quarter
,RowDiffCalc (MasterDate, GDPBillions, isAdjusted, RowNumVal, RowNumYear)
AS
(
	 SELECT  MasterDate
            ,GDPBillions
			,isAdjusted
			,ROW_NUMBER() OVER(PARTITION BY YEAR(MasterDate), GDPBillions ORDER BY MasterDate)
			,ROW_NUMBER() OVER(PARTITION BY YEAR(MasterDate) ORDER BY MasterDate)
       FROM RowDate
      WHERE RowNum = 1
   
)

INSERT INTO WGUCapstone.CapstoneUI.GDPAdjusted
     SELECT  a.MasterDate
            ,ISNULL(a.GDPBillions - (a.GDPBillions - (SELECT ISNULL(b.GDPBillions, 0)
                                                        FROM RowDiffCalc b
							                             WHERE a.isAdjusted = 1
							                               AND ((b.RowNumYear = a.RowNumYear + 2
							                               AND YEAR(b.MasterDate) = YEAR(a.MasterDate))
														    OR (MONTH(a.MasterDate) IN (10, 11, 12)
														   AND YEAR(b.MasterDate) = YEAR(a.MasterDate) + 1
														   AND b.RowNumYear = a.RowNumYear - 9)))) * .33 * (a.RowNumVal - 1), a.GDPBillions) AS GDPBillions --To get our final value we increment each month between quarter-ends by 1/3 or the differenc between the earlier quarter and the later quarter.
		     ,a.isAdjusted
      FROM RowDiffCalc a
  ORDER BY MasterDate

--Return the adjusted dataset for review
SELECT  a.AsOfDate
	   ,a.GDPBillions
  FROM WGUCapstone.CapstoneUI.GDPAdjusted a
END
GO


