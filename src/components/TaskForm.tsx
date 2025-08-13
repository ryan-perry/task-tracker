import { useState, type FormEvent } from 'react';
import { Stack, TextField, Button } from '@mui/material';

interface TaskFormProps {
  onAdd: (text: string) => void;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    onAdd(text);

    setText('');
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2 }}>
          <TextField
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="New Task"
            variant="outlined"
          />
          <Button
            type="submit"
            variant="contained">
            Add
          </Button>
        </Stack>
      </form>
    </>
  );
}
