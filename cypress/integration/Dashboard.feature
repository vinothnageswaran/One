Feature: Verify UI elements in Deviation Management Dashboard

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

 