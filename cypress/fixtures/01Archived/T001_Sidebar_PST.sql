SET QUOTED_IDENTIFIER OFF
SET ANSI_NULLS ON

use LstProxyAutomation
go

exec PointInflowOutflowToSeed

delete from Seed.Inflow
delete from Seed.Outflow
delete from Seed.OutflowProduct
delete from Seed.OutflowActivity

declare @s datetime = dateadd(DD, -1, sysdatetime())
declare @e datetime = dateadd(DD, 2, sysdatetime())

declare @dtsStart datetime = dateadd(MINUTE, 15, sysdatetime())

exec Seed.CreateOutflow 111111, 'A', @s, @e, 'MACF', 100000, 100000
exec Seed.CreateDTSInflow '20M0001A', 'MACF', 'CD1', @dtsStart, 120, 'A', 'SL2', '245', 18000


