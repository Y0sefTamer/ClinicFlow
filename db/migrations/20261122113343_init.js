/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("full_name", 120).notNullable();
    table.string("email", 160).notNullable().unique();
    table.string("phone", 30).nullable();
    table.text("password_hash").notNullable();
    table
      .enu("role", ["ADMIN", "DOCTOR", "PATIENT"], {
        useNative: true,
        enumName: "user_role_enum",
      })
      .notNullable()
      .defaultTo("PATIENT");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  
  await knex.schema.createTable("services", (table) => {
    table.increments("id").primary();
    table
      .integer("doctor_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table.string("title", 150).notNullable();
    table.text("description").nullable();
    table.integer("duration_mins").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.check("?? > 0", ["duration_mins"], "chk_services_duration_positive");
    table.check("?? >= 0", ["price"], "chk_services_price_non_negative");
    table.index(["doctor_id"], "idx_services_doctor_id");
  });

  
  await knex.schema.createTable("appointments", (table) => {
    table.increments("id").primary();
    table
      .integer("patient_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table
      .integer("doctor_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table
      .integer("service_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("services")
      .onDelete("RESTRICT");
    table.timestamp("start_at", { useTz: true }).notNullable();
    table.timestamp("end_at", { useTz: true }).notNullable();
    table
      .enu(
        "status",
        ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"],
        {
          useNative: true,
          enumName: "appointment_status_enum",
        }
      )
      .notNullable()
      .defaultTo("PENDING");
    table.text("notes").nullable();
    table.timestamps(true, true);

    table.check("?? > ??", ["end_at", "start_at"], "chk_appointments_end_after_start");
    table.index(["doctor_id", "start_at", "end_at"], "idx_appointments_doctor_schedule");
    table.index(["patient_id"], "idx_appointments_patient_id");
  });

  
  await knex.schema.createTable("invoices", (table) => {
    table.increments("id").primary();
    table
      .integer("appointment_id")
      .unsigned()
      .notNullable()
      .unique()
      .references("id")
      .inTable("appointments")
      .onDelete("RESTRICT");
    table
      .integer("patient_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table.decimal("amount", 10, 2).notNullable();
    table.decimal("discount", 10, 2).notNullable().defaultTo(0);
    table.decimal("final_amount", 10, 2).notNullable();
    table
      .enu("status", ["UNPAID", "PAID", "REFUNDED"], {
        useNative: true,
        enumName: "invoice_status_enum",
      })
      .notNullable()
      .defaultTo("UNPAID");
    table.timestamp("paid_at", { useTz: true }).nullable();
    table.timestamps(true, true);

    table.check("?? >= 0", ["amount"], "chk_invoices_amount_non_negative");
    table.check("?? >= 0", ["discount"], "chk_invoices_discount_non_negative");
    table.check("?? >= 0", ["final_amount"], "chk_invoices_final_amount_non_negative");
    table.index(["patient_id", "status"], "idx_invoices_patient_status");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
