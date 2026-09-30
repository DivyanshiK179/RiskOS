with open('backend/relocation/views.py', 'r', encoding='utf-8') as f:
    code = f.read()

new_update = """    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)
        
        # Deduct capacity from SafeSite when Relocation Plan is COMPLETED
        if old_status != 'COMPLETED' and new_status == 'COMPLETED':
            site = instance.safe_site
            site.current_occupied += instance.population_to_relocate
            site.save()
            
        serializer.save()"""

code = code.replace('    def perform_create(self, serializer):\n        serializer.save(created_by=self.request.user)', 
                   '    def perform_create(self, serializer):\n        serializer.save(created_by=self.request.user)\n\n' + new_update)

with open('backend/relocation/views.py', 'w', encoding='utf-8') as f:
    f.write(code)
print('Patched relocation views for capacity tracking!')
