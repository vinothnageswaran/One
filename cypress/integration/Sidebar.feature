Feature: Verify Sidebar on the Dashboard

  Background:
   
 
  
  Scenario: Verify the sidebar is displayed
  Given User select a rake and verifies sidebar labels and its values
  When User click on the Rake
  Then the sidebar is displayed

  Scenario:  Verify Product Quality Fe% P% Al2O3% SiO2% H2O%
  Then the product quality details are as expected
  
  Scenario:  Verify Sailtime
  Then Sailtime is as expected
  
  Scenario:  Verify customer is customer1
  Then customer is customer1

  Scenario:  Verify Arrivaltime
  Then Arrivaltime is as expected

  Scenario:  Verify Required time to dumper
  Then Required time to dumper is as expected

  Scenario:  Verify Scheduled dump time
  Then Scheduled dump time is as expected

  Scenario:  Verify the product is MACF
  Then the product is MACF

  Scenario: Verify Vessel details are TBN CAPE | 111111 |
  The the vessel details are TBN CAPE | 111111 |

  Scenario:  Verify GLR current
  Then GLR current is 0 tonnes per hour

  Scenario:  Verify GLR Required
  Then GLR Required is 7026 tonnes per hour

  Scenario:  Verify GLR Allocated
  Then GLR Required is 7026 tonnes per hour

  Scenario:  Verify Projected Quality is ON SPEC
  Then Projected Quality is ON SPEC

  Scenario:  Verify Remaining tonnes is 100k
  Then Remaining tonnes is 100k

  Scenario:  Verify Unallocated tonnes is 82.00kt/5 Rakes
  Then Unallocated tonnes is as expected

  Scenario:  Verify GLR product details - Loaded 0.00kt/100.00kt contracted 100kt(0)% and Projected quality is ONSPEC
  Then GLR product details are correct

  Scenario:  Verify Allocations -Car dumper details
  Then Car dumper details are correct
  
  Scenario: Verify  Portarrival time is correct
  Then the Portarrival time is correct

  Scenario: Verify Allocated tone is 7026tph
  Then  Allocated tone is 7026tph

  Scenario:  Verify SailBuffer is N/A
  Then SailBuffer is as NA

 


