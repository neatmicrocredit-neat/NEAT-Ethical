import * as React from 'react';

export function CustomerEmailTemplate({
    first_name,
    last_name,
    phone_number,
    email,

}) {
  return (
    <div>
      <h1>Hello, {first_name}!</h1>
    </div>
  );
}