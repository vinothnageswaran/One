Feature: Verify UI elements and its labels in Deviation Management Dashboard

  Background:
    Given User navigates to Deviation Management Dashboard
 
  
  Scenario: Verify Yard
  Then The top panel has "Yard"

  Scenario: Verify Equipment
  Then the "Equipment" appears in top panel

  Scenario: Verify Dashboard
  Then the "Dashboard" appears on top right 

  Scenario: Verify Save button
  Then the "Save" button appears on top right
  
  Scenario: Verify Auxiliary button
  Then the "Auxiliary" button appears on top right corner
  
  Scenario: Verify NY button
  Then the North Yard button appears as "NY"

  Scenario: Verify SY button
  Then the South Yard button appears as "SY"

  Scenario: Verify EY button
  Then the East Yard button appears as "EY"

  Scenario: Verify WY button
  Then the West Yard button appears as "WY"


  Scenario: Verify Rakearrival panel and it's label
  Then the "Rake Arrival" panel appears on top left

  Scenario: Verify Stabled Rakes panel and it's label
  Then the "Stabled Rakes" panel appears on the top as an item 2
 
  Scenario: Verify SPA Allocation panel and it's label
  Then the "SPA Allocation" panel appears  on the top as an item 3

  Scenario: Verify Tide and it's label
  Then the "Tide" panel appears  on the top as an item 4

 
  Scenario: Verify Rake information
  Then Select Rake ER-0001A and Verify Rake title on side bar is "ER-0001A"




 