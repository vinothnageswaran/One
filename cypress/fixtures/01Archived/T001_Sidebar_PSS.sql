SET QUOTED_IDENTIFIER OFF
SET ANSI_NULLS ON

use LSTIOPSDbSeedAutomation
go

declare @dumpStart datetime = dateadd(MINUTE, -45, sysdatetime())

exec DeleteAll

declare @rakeArrival datetime = dateadd(HOUR, -1, sysdatetime())
declare @vesselArrival datetime = dateadd(HOUR, -10, sysdatetime())
declare @laycanEnd datetime = dateadd(DD, 10, sysdatetime())

exec CreateRake '20M0001A', 'MACF', @rakeArrival
exec CreateNominationOnBerth 111111, '999999', 'TBN TIM', @rakeArrival, 'A'
exec CreateNominationItem 111111, 1, 'MACF', 100000, @vesselArrival, @vesselArrival, @laycanEnd

exec CreateOperationalDumpLoad 111111, '20M0001A', 'MACF', 10000, @dumpStart, null, 'CD1', 'SL2', '245', 'A'

update Interface.RakeCargo set ProcessedDumperCars = 80

go


