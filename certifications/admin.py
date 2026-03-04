from django.contrib import admin
from django.utils.html import format_html, mark_safe
from django.db import models
from django.forms import Textarea
from .models import Certification, Modulo


class ModuloInline(admin.TabularInline):
    model = Modulo
    extra = 1
    verbose_name = "Módulo"
    verbose_name_plural = "Módulos do Curso"
    fields = ("nome",)
    

@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    
    # Configurações de listagem
    list_display = ("student_info", "course_info", "status_display", "date_display", "link_display")
    readonly_fields = ('link_card', 'created_at', 'updated_at')
    list_filter = ("status", "ano", "data_conclusao", "curso")
    search_fields = ("nome_completo", "curso", "codigo", "documento")
    date_hierarchy = 'data_conclusao'
    list_per_page = 50
    ordering = ('-created_at',)

    fieldsets = (
        ("Informações do Estudante", {
            "fields": ("nome_completo", "documento", "foto"),
            'description': 'Dados pessoais do estudante'
        }),
        ("Dados do Curso", {
            "fields": ("curso", "duracao", "carga_horaria", "data_conclusao", "ano", "descricao"),
            'description': 'Informações sobre o curso e certificação'
        }),
        ("Declaração e Status", {
            "fields": ("codigo", "status", "declaracao"),
            'description': 'Status da certificação e texto da declaração'
        }),
        ("Link de Compartilhamento", {
            "fields": ("unique_link", "link_card"),
            'description': 'Edite o link único ou deixe em branco para gerar automaticamente'
        }),
        ("Informações do Sistema", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
        
    )

    inlines = [ModuloInline]

    formfield_overrides = {
        models.TextField: {
            'widget': Textarea(
                attrs={'rows': 6, 'cols': 80, 'style': 'width: 100%; border-radius: 4px;'}
            )
        },
    }

    # Métodos de exibição personalizados
    def student_info(self, obj):
        return format_html(
            '<div style="display: flex; flex-direction: column; gap: 4px;">'
            '<strong style="font-size: 14px;">{}</strong>'
            '<small style="color: #6c757d;">Doc: {}</small>'
            '</div>',
            obj.nome_completo, obj.documento
        )
    student_info.short_description = 'Estudante'
    student_info.admin_order_field = 'nome_completo'

    def course_info(self, obj):
        return format_html(
            '<div style="display: flex; flex-direction: column; gap: 4px;">'
            '<strong style="color: #007bff;">{}</strong>'
            '<small style="color: #6c757d;">{} • {}</small>'
            '</div>',
            obj.curso[:40] + ('...' if len(obj.curso) > 40 else ''),
            obj.duracao,
            obj.carga_horaria
        )
    course_info.short_description = 'Curso'
    course_info.admin_order_field = 'curso'

    def status_display(self, obj):
        colors = {
            'Aprovado': '#28a745',
            'Reprovado': '#dc3545',
            'Em Andamento': '#ffc107'
        }
        color = colors.get(obj.status, '#6c757d')
        
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 12px; border-radius: 12px; '
            'font-size: 12px; font-weight: 500; display: inline-block;">{}</span>',
            color, obj.status
        )
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'

    def date_display(self, obj):
        return format_html(
            '<div style="display: flex; flex-direction: column; gap: 2px;">'
            '<strong>{}</strong>'
            '<small style="color: #6c757d;">Ano: {}</small>'
            '</div>',
            obj.data_conclusao.strftime("%d/%m/%Y"),
            obj.ano
        )
    date_display.short_description = 'Data de Conclusão'
    date_display.admin_order_field = 'data_conclusao'

    def link_display(self, obj):
        if obj.unique_link:
            public_url = f"https://www.cptec.co.mz/declaracoes/{obj.unique_link}"
            return format_html(
                '<a href="{}" target="_blank" '
                'style="background: #007bff; color: white; padding: 6px 12px; border-radius: 6px; '
                'text-decoration: none; font-size: 12px; display: inline-block;">'
                '🔗 Ver Link</a>',
                public_url
            )
        return mark_safe('<span style="color: #6c757d;">Aguardando...</span>')
    link_display.short_description = 'Link'

    def link_card(self, obj):
        if obj.unique_link:
            public_url = f"/api/certifications/view/{obj.unique_link}/"
            share_url = f"https://www.cptec.co.mz/declaracoes/{obj.unique_link}"
            return format_html(
                '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); '
                'padding: 24px; border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">'
                '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">'
                '<div style="display: flex; align-items: center; gap: 12px;">'
                '<span style="font-size: 32px;">🔗</span>'
                '<h3 style="margin: 0; font-size: 18px;">Link de Compartilhamento</h3>'
                '</div>'
                '<button onclick="editLink()" id="editLinkBtn" '
                'style="background: rgba(255,255,255,0.3); color: white; padding: 8px 16px; '
                'border-radius: 6px; border: none; cursor: pointer; font-weight: 500; '
                'backdrop-filter: blur(10px); font-size: 14px;">✏️ Editar Link</button>'
                '</div>'
                '<div id="linkDisplay" style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px;">'
                '<input type="text" id="linkInput" value="{}" readonly '
                'style="width: 100%; border: none; padding: 8px; font-family: monospace; color: #333; '
                'font-size: 13px; background: transparent;" onclick="this.select(); document.execCommand(\'copy\'); '
                'alert(\'Link copiado para a área de transferência!\');">'
                '</div>'
                '<div id="editControls" style="display: none; margin-bottom: 12px; gap: 8px;">'
                '<input type="text" id="newLinkInput" value="{}" '
                'style="flex: 1; padding: 10px; border: 2px solid rgba(255,255,255,0.3); '
                'border-radius: 6px; font-family: monospace; background: rgba(255,255,255,0.95); '
                'color: #333; font-size: 13px;">'
                '<div style="display: flex; gap: 8px; margin-top: 8px;">'
                '<button onclick="saveLink()" '
                'style="flex: 1; background: #28a745; color: white; padding: 10px; '
                'border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">💾 Salvar</button>'
                '<button onclick="cancelEdit()" '
                'style="flex: 1; background: #dc3545; color: white; padding: 10px; '
                'border-radius: 6px; border: none; cursor: pointer; font-weight: 500;">❌ Cancelar</button>'
                '</div>'
                '</div>'
                '<div style="display: flex; gap: 12px;">'
                '<a href="{}" target="_blank" '
                'style="flex: 1; background: rgba(255,255,255,0.2); color: white; padding: 10px; '
                'border-radius: 6px; text-decoration: none; text-align: center; font-weight: 500; '
                'backdrop-filter: blur(10px);">👁️ Visualizar</a>'
                '<button onclick="navigator.clipboard.writeText(\'{}\').then(() => '
                'alert(\'Link copiado!\'));" '
                'style="flex: 1; background: rgba(255,255,255,0.2); color: white; padding: 10px; '
                'border-radius: 6px; border: none; cursor: pointer; font-weight: 500; '
                'backdrop-filter: blur(10px);">📋 Copiar</button>'
                '</div>'
                '<p style="margin: 16px 0 0 0; font-size: 12px; opacity: 0.9;">'
                '✨ Clique no campo para selecionar e copiar o link automaticamente'
                '</p>'
                '</div>'
                '<script>'
                'function editLink() {{'
                '  document.getElementById("linkDisplay").style.display = "none";'
                '  document.getElementById("editControls").style.display = "block";'
                '  document.getElementById("editLinkBtn").style.display = "none";'
                '  document.getElementById("newLinkInput").focus();'
                '}}'
                'function cancelEdit() {{'
                '  document.getElementById("linkDisplay").style.display = "block";'
                '  document.getElementById("editControls").style.display = "none";'
                '  document.getElementById("editLinkBtn").style.display = "block";'
                '}}'
                'function saveLink() {{'
                '  var newLink = document.getElementById("newLinkInput").value.trim();'
                '  if (!newLink) {{'
                '    alert("O link não pode estar vazio!");'
                '    return;'
                '  }}'
                '  document.getElementById("id_unique_link").value = newLink;'
                '  alert("Link atualizado! Clique em SALVAR no final da página para confirmar.");'
                '  cancelEdit();'
                '  document.getElementById("linkInput").value = newLink;'
                '}}'
                '</script>',
                share_url, obj.unique_link, share_url, share_url
            )
        return mark_safe(
            '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; '
            'border: 2px dashed #dee2e6;">'
            '<span style="font-size: 48px; display: block; margin-bottom: 12px;">🔗</span>'
            '<p style="color: #6c757d; margin: 0;">O link será gerado automaticamente ao salvar</p>'
            '</div>'
        )
    link_card.short_description = 'Link para Compartilhar'

    def save_model(self, request, obj, form, change):
        """Adiciona mensagens personalizadas ao salvar"""
        if not change:
            super().save_model(request, obj, form, change)
            self.message_user(
                request, 
                f'✅ Certificação criada com sucesso para {obj.nome_completo}',
                'success'
            )
        else:
            super().save_model(request, obj, form, change)
            self.message_user(
                request, 
                f'✅ Certificação de {obj.nome_completo} atualizada',
                'success'
            )

    class Media:
        js = ('admin/js/certification_link.js',)
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Modulo)
class ModuloAdmin(admin.ModelAdmin):
    list_display = ("module_display", "certification_display", "course_display")
    list_filter = ("certification__curso", "certification__status")
    search_fields = ("nome", "certification__curso", "certification__nome_completo")
    ordering = ('-id',)
    list_per_page = 50

    def module_display(self, obj):
        return format_html(
            '<div style="display: flex; align-items: center; gap: 8px;">'
            '<span style="font-size: 18px;">📚</span>'
            '<strong>{}</strong>'
            '</div>',
            obj.nome
        )
    module_display.short_description = 'Módulo'

    def certification_display(self, obj):
        return format_html(
            '<div style="display: flex; flex-direction: column; gap: 2px;">'
            '<strong>{}</strong>'
            '<small style="color: #6c757d;">ID: #{}</small>'
            '</div>',
            obj.certification.nome_completo, obj.certification.id
        )
    certification_display.short_description = 'Certificação'

    def course_display(self, obj):
        return format_html(
            '<span style="background: #007bff; color: white; padding: 4px 10px; '
            'border-radius: 8px; font-size: 11px; font-weight: 500;">{}</span>',
            obj.certification.curso[:30] + ('...' if len(obj.certification.curso) > 30 else '')
        )
    course_display.short_description = 'Curso'