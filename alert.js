/* Copyright (C) 2023-2024 anonymous

This file is part of PSFree.

PSFree is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

PSFree is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

// IMPROVED VERSION - NON-BLOCKING ERROR HANDLING
// Instead of blocking alerts, we log to console and continue execution

addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    console.error(
        'Unhandled rejection',
        reason,
        `${reason.sourceURL}:${reason.line}:${reason.column}`,
        reason.stack
    );
    // Prevent default behavior (no alert popup)
    event.preventDefault();
});

addEventListener('error', event => {
    const reason = event.error;
    console.error(
        'Unhandled error',
        reason,
        `${reason.sourceURL}:${reason.line}:${reason.column}`,
        reason.stack
    );
    // Prevent default behavior (no alert popup)
    event.preventDefault();
    return true;
});

// we have to dynamically import the program if we want to catch its syntax errors
import('./psfree.js');
