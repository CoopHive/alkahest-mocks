// Arbiter integration tests module
// This module organizes all arbiter-related tests

pub mod arbiter_recipient;
pub mod arbiter_uid;
pub mod logical_api;

// Core arbiter tests split from arbiters_main.rs
pub mod common;
pub mod generic_check;
pub mod intrinsics_arbiters;
pub mod trivial_arbiter;
pub mod trusted_oracle_arbiter;
