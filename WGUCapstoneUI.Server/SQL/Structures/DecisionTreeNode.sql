USE [WGUCapstone]
GO

/****** Object:  Table [CapstoneUI].[DecisionTreeNode]    Script Date: 12/22/2024 8:49:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [CapstoneUI].[DecisionTreeNode](
	[DecisionTreeID] [int] IDENTITY(1,1) NOT NULL,
	[RandomForestID] [int] NULL,
	[RandomForest_Version] [int] NULL,
	[Depth] [int] NULL,
	[MaxDepth] [int] NULL,
	[MinSamplesToSplit] [int] NULL,
	[isRoot] [bit] NULL,
	[isLeaf] [bit] NULL,
	[CAT_ClassValue] [nvarchar](max) NULL,
	[NUM_ClassValue] [decimal](18, 2) NULL,
	[FeatureIndex] [int] NULL,
	[Left_DecisionTreeID] [int] NULL,
	[Right_DecisionTreeID] [int] NULL,
	[CAT_Threshold] [nvarchar](max) NULL,
	[NUM_Threshold] [decimal](18, 2) NULL,
 CONSTRAINT [PK_DecisionTreeNode] PRIMARY KEY CLUSTERED 
(
	[DecisionTreeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [CapstoneUI].[DecisionTreeNode]  WITH CHECK ADD  CONSTRAINT [FK__DecisionTreeNode__15DA3E5D] FOREIGN KEY([RandomForestID], [RandomForest_Version])
REFERENCES [CapstoneUI].[RandomForest] ([RandomForestID], [Version])
ON UPDATE CASCADE
ON DELETE CASCADE
GO

ALTER TABLE [CapstoneUI].[DecisionTreeNode] CHECK CONSTRAINT [FK__DecisionTreeNode__15DA3E5D]
GO

ALTER TABLE [CapstoneUI].[DecisionTreeNode]  WITH CHECK ADD  CONSTRAINT [FK_DecisionTreeNode_DecisionTreeNode] FOREIGN KEY([Left_DecisionTreeID])
REFERENCES [CapstoneUI].[DecisionTreeNode] ([DecisionTreeID])
GO

ALTER TABLE [CapstoneUI].[DecisionTreeNode] CHECK CONSTRAINT [FK_DecisionTreeNode_DecisionTreeNode]
GO

ALTER TABLE [CapstoneUI].[DecisionTreeNode]  WITH CHECK ADD  CONSTRAINT [FK_DecisionTreeNode_DecisionTreeNode1] FOREIGN KEY([Right_DecisionTreeID])
REFERENCES [CapstoneUI].[DecisionTreeNode] ([DecisionTreeID])
GO

ALTER TABLE [CapstoneUI].[DecisionTreeNode] CHECK CONSTRAINT [FK_DecisionTreeNode_DecisionTreeNode1]
GO


