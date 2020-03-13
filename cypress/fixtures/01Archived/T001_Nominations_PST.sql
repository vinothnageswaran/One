-- Setup PST data

SET QUOTED_IDENTIFIER OFF
SET ANSI_NULLS ON

use LstProxyAutomation


exec PointInflowOutflowToSeed

delete from Seed.Inflow
delete from Seed.Outflow
delete from Seed.OutflowProduct
delete from Seed.OutflowActivity

declare @s datetime = dateadd(DD, -1, sysdatetime())
declare @e datetime = dateadd(DD, 2, sysdatetime())

declare @dtsStart datetime = dateadd(MINUTE, 15, sysdatetime())

exec Seed.CreateOutflow 111111, 'A', @s, @e, 'MACF', 100000, 100000

exec Seed.CreateReclaimOutflow 111111, 'BWR5', 'A3', 'MACF', @dtsStart, 120, 'A', 'SL2', '53', 12000






