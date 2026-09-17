export interface ButtonComponent {
  type: 2;
  style: 1 | 2 | 3 | 4 | 5; // 1: Primary, 2: Secondary, 3: Success, 4: Danger, 5: Link
  label: string;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
  emoji?: { name: string; id?: string };
}

export interface ActionRowComponent {
  type: 1;
  components: ButtonComponent[];
}
