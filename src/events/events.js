import { query } from '../lib/db.js';

export async function createEvent({ name, slug, description, user } = {}) {
  const q = `
    INSERT INTO events
      (name, slug, description, creatorId)
    VALUES
      ($1, $2, $3, $4)
    RETURNING id, name, slug, description;
  `;
  const values = [name, slug, description, user];

  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function deleteEvent(id) {
  // First all registrations
  const deleteRegistrationsResult = await query(
    'DELETE FROM registrations WHERE event = $1;',
    [id]
  );
  if (!deleteRegistrationsResult) {
    console.warn('unable to delete registrations', id);
    return false;
  }

  // Then the event
  // BUT! If something fails here we're not doing this as an atomic action
  const deleteEventResult = await query('DELETE FROM events WHERE id = $1;', [
    id,
  ]);

  if (deleteEventResult && deleteEventResult.rowCount === 1) {
    return true;
  }

  console.warn('unable to delete event', id);

  return false;
}

export async function register({ name, comment, event } = {}) {
  const q = `
    INSERT INTO registrations
      (name, comment, event)
    VALUES
      ($1, $2, $3)
    RETURNING
      id, name, comment, event;
  `;
  const values = [name, comment, event];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listEvents() {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
  `;

  const result = await query(q);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function listEvent(id) {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
    WHERE id = $1
  `;

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listEventByName(name) {
  const q = `
    SELECT
      id, name, slug, description, created, updated
    FROM
      events
    WHERE name = $1
  `;

  const result = await query(q, [name]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listRegistered(event) {
  const q = `
    SELECT
      id, name, comment
    FROM
      registrations
    WHERE event = $1
  `;

  const result = await query(q, [event]);

  if (result) {
    return result.rows;
  }

  return null;
}