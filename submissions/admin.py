from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html, mark_safe
import csv
import datetime
from .models import Submission

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    
    list_display = (
        'name_display', 
        'email_display', 
        'service_display', 
        'created_display', 
        'consent_display'
    )
    
    list_filter = (
        ('created_at', admin.DateFieldListFilter),
        'service', 
        'consent'
    )
    
    search_fields = ('name', 'email', 'phone', 'service', 'message')
    
    # Todos os campos são readonly pois vêm do frontend
    readonly_fields = ('name', 'email', 'phone', 'service', 'message', 'consent', 'created_at', 'updated_at', 'submission_detail')
    
    ordering = ('-created_at',)
    list_per_page = 50
    date_hierarchy = 'created_at'
    
    actions = ['export_to_csv']
    
    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('name', 'email', 'phone'),
            'classes': ('wide',),
            'description': 'Dados de contato do solicitante (somente leitura)'
        }),
        ('Detalhes da Solicitação', {
            'fields': ('service', 'message'),
            'classes': ('wide',),
            'description': 'Informações sobre o serviço solicitado (somente leitura)'
        }),
        ('Sistema', {
            'fields': ('consent', 'created_at', 'updated_at', 'submission_detail'),
            'classes': ('collapse',),
            'description': 'Informações do sistema e consentimento'
        }),
    )
    
    # Desabilita a edição de submissões
    def has_add_permission(self, request):
        """Desabilita adição manual de submissões"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Permite visualização mas não edição"""
        return True
    
    def has_delete_permission(self, request, obj=None):
        """Permite deleção de submissões"""
        return True

    # Métodos de exibição personalizados
    def name_display(self, obj):
        return format_html(
            '<div style="display: flex; align-items: center; gap: 8px;">'
            '<span style="font-size: 18px;">👤</span>'
            '<strong>{}</strong>'
            '</div>',
            obj.name
        )
    name_display.short_description = 'Nome'
    name_display.admin_order_field = 'name'

    def email_display(self, obj):
        return format_html(
            '<a href="mailto:{}" style="color: #0066cc; text-decoration: none; display: flex; align-items: center; gap: 6px;">'
            '<span style="font-size: 16px;">📧</span>{}</a>',
            obj.email, obj.email
        )
    email_display.short_description = 'Email'
    email_display.admin_order_field = 'email'

    def phone_display(self, obj):
        return format_html(
            '<a href="tel:{}" style="color: #00cc66; text-decoration: none; display: flex; align-items: center; gap: 6px;">'
            '<span style="font-size: 16px;">📱</span>'
            '<code style="background: #f0f0f0; padding: 2px 8px; border-radius: 4px;">{}</code></a>',
            obj.phone, obj.phone
        )
    phone_display.short_description = 'Telefone'
    phone_display.admin_order_field = 'phone'

    def service_display(self, obj):
        colors = {
            'ISO 14001': '#28a745',
            'ISO 9001': '#007bff',
            'ISO 45001': '#dc3545',
            'Higiene': '#fd7e14',
            'Monitoria': '#6f42c1',
            'NEBOSH': '#20c997'
        }
        
        color = next((v for k, v in colors.items() if k in obj.service), '#6c757d')
        
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 12px; border-radius: 12px; '
            'font-size: 12px; font-weight: 500; display: inline-block;">{}</span>',
            color, obj.service[:30] + ('...' if len(obj.service) > 30 else '')
        )
    service_display.short_description = 'Serviço'
    service_display.admin_order_field = 'service'

    def created_display(self, obj):
        now = datetime.datetime.now(obj.created_at.tzinfo)
        diff = now - obj.created_at
        
        if diff.days == 0:
            if diff.seconds < 3600:
                time_str = f"{diff.seconds // 60} min atrás"
                badge_color = '#28a745'
            else:
                time_str = f"{diff.seconds // 3600}h atrás"
                badge_color = '#ffc107'
        elif diff.days == 1:
            time_str = "Ontem"
            badge_color = '#fd7e14'
        else:
            time_str = obj.created_at.strftime("%d/%m/%Y")
            badge_color = '#6c757d'
            
        return format_html(
            '<div style="display: flex; flex-direction: column; gap: 2px;">'
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 8px; '
            'font-size: 11px; font-weight: 500; display: inline-block; width: fit-content;">{}</span>'
            '<small style="color: #6c757d;">{}</small>'
            '</div>',
            badge_color, time_str, obj.created_at.strftime("%H:%M")
        )
    created_display.short_description = 'Data'
    created_display.admin_order_field = 'created_at'

    def consent_display(self, obj):
        if obj.consent:
            return mark_safe('<span style="color: #28a745; font-weight: 600;">✓ Sim</span>')
        return mark_safe('<span style="color: #dc3545; font-weight: 600;">✗ Não</span>')
    consent_display.short_description = 'Consentimento'
    consent_display.admin_order_field = 'consent'

    def submission_detail(self, obj):
        return format_html(
            '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">'
            '<h3 style="margin-top: 0; color: #007bff; font-size: 16px;">Detalhes da Submissão</h3>'
            '<table style="width: 100%; border-collapse: collapse;">'
            '<tr><td style="padding: 8px; font-weight: 600;">ID:</td><td style="padding: 8px;">#{}</td></tr>'
            '<tr style="background: #fff;"><td style="padding: 8px; font-weight: 600;">Data/Hora:</td><td style="padding: 8px;">{}</td></tr>'
            '<tr><td style="padding: 8px; font-weight: 600; vertical-align: top;">Mensagem:</td>'
            '<td style="padding: 8px;"><div style="background: white; padding: 12px; border-radius: 4px; '
            'max-height: 150px; overflow-y: auto; white-space: pre-wrap;">{}</div></td></tr>'
            '</table>'
            '</div>',
            obj.id, 
            obj.created_at.strftime("%d/%m/%Y às %H:%M"),
            obj.message or "Nenhuma mensagem adicional"
        )
    submission_detail.short_description = 'Detalhes Completos'

    # Ações personalizadas
    def export_to_csv(self, request, queryset):
        """Exporta submissões selecionadas para CSV"""
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="submissions_{datetime.date.today()}.csv"'
        response.write('\ufeff')  # BOM para Excel
        
        writer = csv.writer(response)
        writer.writerow(['Nome', 'Email', 'Telefone', 'Serviço', 'Mensagem', 'Data', 'Consentimento'])
        
        for submission in queryset:
            writer.writerow([
                submission.name,
                submission.email,
                submission.phone,
                submission.service,
                submission.message,
                submission.created_at.strftime('%d/%m/%Y %H:%M'),
                'Sim' if submission.consent else 'Não'
            ])
        
        self.message_user(request, f'{queryset.count()} submissões exportadas com sucesso!', 'success')
        return response
    
    export_to_csv.short_description = "📥 Exportar para CSV"

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


# Personalização do site admin
admin.site.site_header = 'CPTec Academy - Painel Administrativo'
admin.site.site_title = 'CPTec Admin'
admin.site.index_title = 'Bem-vindo ao Dashboard'